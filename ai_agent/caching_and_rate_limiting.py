#!/usr/bin/env python3
"""
Advanced Caching and Rate Limiting Strategy for Atlas Real Estate Scraping
Implements intelligent caching, rate limiting, and request optimization
"""

import asyncio
import hashlib
import json
import logging
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
import redis
import aioredis
from contextlib import asynccontextmanager
import httpx
from collections import defaultdict, deque
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class CacheEntry:
    """Structure for cached data entries"""
    data: Any
    cached_at: datetime
    expires_at: datetime
    access_count: int = 0
    last_accessed: datetime = None
    cache_key: str = ""
    source: str = "scraper"
    data_quality_score: float = 0.0
    cache_tags: List[str] = None

    def __post_init__(self):
        if self.last_accessed is None:
            self.last_accessed = self.cached_at
        if self.cache_tags is None:
            self.cache_tags = []

@dataclass
class RateLimitConfig:
    """Rate limiting configuration per platform"""
    platform: str
    max_requests_per_minute: int
    max_requests_per_hour: int
    max_requests_per_day: int
    burst_allowance: int = 5
    cooldown_seconds: int = 60
    priority_multiplier: float = 1.0

class IntelligentCache:
    """
    Advanced caching system with tiered storage and intelligent eviction
    """
    
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.redis_client = None
        self.local_cache = {}  # In-memory cache for hot data
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'evictions': 0
        }
        self.logger = logging.getLogger(__name__)
        
        # Cache configuration
        self.cache_ttl_rules = {
            'property_analysis': timedelta(hours=24),
            'market_data': timedelta(hours=6),
            'neighborhood_data': timedelta(days=7),
            'comparable_properties': timedelta(hours=12),
            'property_images': timedelta(days=30),
            'geocoding': timedelta(days=30),
            'screenshots': timedelta(hours=6)
        }
        
        # Memory limits
        self.max_local_cache_size = 1000
        self.high_priority_cache_size = 200
    
    async def start(self):
        """Initialize cache connections"""
        try:
            self.redis_client = await aioredis.from_url(
                self.redis_url,
                encoding='utf-8',
                decode_responses=True,
                max_connections=20
            )
            await self.redis_client.ping()
            self.logger.info("Redis cache connection established")
        except Exception as e:
            self.logger.warning(f"Redis unavailable, using local cache only: {e}")
            self.redis_client = None
    
    async def close(self):
        """Close cache connections"""
        if self.redis_client:
            await self.redis_client.close()
    
    def _generate_cache_key(self, key_components: Dict[str, Any]) -> str:
        """Generate deterministic cache key from components"""
        # Sort components for consistent keys
        sorted_components = sorted(key_components.items())
        key_string = json.dumps(sorted_components, sort_keys=True)
        return hashlib.sha256(key_string.encode()).hexdigest()[:16]
    
    async def get(self, 
                  key_components: Dict[str, Any], 
                  cache_type: str = 'property_analysis') -> Optional[CacheEntry]:
        """Get cached data with intelligent retrieval"""
        cache_key = self._generate_cache_key(key_components)
        
        # Try local cache first (fastest)
        if cache_key in self.local_cache:
            entry = self.local_cache[cache_key]
            if entry.expires_at > datetime.now():
                entry.access_count += 1
                entry.last_accessed = datetime.now()
                self.cache_stats['hits'] += 1
                self.logger.debug(f"Local cache hit: {cache_key}")
                return entry
            else:
                # Expired local cache entry
                del self.local_cache[cache_key]
        
        # Try Redis cache
        if self.redis_client:
            try:
                cached_data = await self.redis_client.get(f"atlas:{cache_type}:{cache_key}")
                if cached_data:
                    entry_dict = json.loads(cached_data)
                    entry = CacheEntry(
                        data=entry_dict['data'],
                        cached_at=datetime.fromisoformat(entry_dict['cached_at']),
                        expires_at=datetime.fromisoformat(entry_dict['expires_at']),
                        access_count=entry_dict.get('access_count', 0),
                        last_accessed=datetime.fromisoformat(entry_dict.get('last_accessed', entry_dict['cached_at'])),
                        cache_key=cache_key,
                        source=entry_dict.get('source', 'scraper'),
                        data_quality_score=entry_dict.get('data_quality_score', 0.0),
                        cache_tags=entry_dict.get('cache_tags', [])
                    )
                    
                    if entry.expires_at > datetime.now():
                        # Update access stats
                        entry.access_count += 1
                        entry.last_accessed = datetime.now()
                        
                        # Promote to local cache if frequently accessed
                        if entry.access_count > 3 or entry.data_quality_score > 80:
                            await self._promote_to_local_cache(cache_key, entry)
                        
                        # Update Redis with new stats
                        await self._update_redis_stats(cache_key, cache_type, entry)
                        
                        self.cache_stats['hits'] += 1
                        self.logger.debug(f"Redis cache hit: {cache_key}")
                        return entry
                    else:
                        # Expired Redis entry
                        await self.redis_client.delete(f"atlas:{cache_type}:{cache_key}")
            except Exception as e:
                self.logger.warning(f"Redis cache get failed: {e}")
        
        self.cache_stats['misses'] += 1
        return None
    
    async def set(self, 
                  key_components: Dict[str, Any], 
                  data: Any, 
                  cache_type: str = 'property_analysis',
                  tags: List[str] = None,
                  data_quality_score: float = 0.0,
                  priority: str = 'normal') -> str:
        """Set cached data with intelligent storage strategy"""
        cache_key = self._generate_cache_key(key_components)
        ttl = self.cache_ttl_rules.get(cache_type, timedelta(hours=24))
        
        entry = CacheEntry(
            data=data,
            cached_at=datetime.now(),
            expires_at=datetime.now() + ttl,
            cache_key=cache_key,
            source='scraper',
            data_quality_score=data_quality_score,
            cache_tags=tags or []
        )
        
        # Always store in Redis for persistence
        if self.redis_client:
            try:
                entry_dict = {
                    'data': data,
                    'cached_at': entry.cached_at.isoformat(),
                    'expires_at': entry.expires_at.isoformat(),
                    'access_count': entry.access_count,
                    'last_accessed': entry.last_accessed.isoformat(),
                    'source': entry.source,
                    'data_quality_score': entry.data_quality_score,
                    'cache_tags': entry.cache_tags
                }
                
                await self.redis_client.setex(
                    f"atlas:{cache_type}:{cache_key}",
                    int(ttl.total_seconds()),
                    json.dumps(entry_dict, default=str)
                )
                
                # Set cache tags for invalidation
                if tags:
                    for tag in tags:
                        await self.redis_client.sadd(f"atlas:tag:{tag}", f"{cache_type}:{cache_key}")
                        await self.redis_client.expire(f"atlas:tag:{tag}", int(ttl.total_seconds()))
                
                self.logger.debug(f"Redis cache set: {cache_key}")
                
            except Exception as e:
                self.logger.warning(f"Redis cache set failed: {e}")
        
        # Store in local cache for high-priority or high-quality data
        if priority == 'high' or data_quality_score > 75:
            await self._promote_to_local_cache(cache_key, entry)
        
        self.cache_stats['sets'] += 1
        return cache_key
    
    async def _promote_to_local_cache(self, cache_key: str, entry: CacheEntry):
        """Promote entry to local in-memory cache"""
        # Implement LRU eviction if cache is full
        if len(self.local_cache) >= self.max_local_cache_size:
            await self._evict_local_cache_entries()
        
        self.local_cache[cache_key] = entry
        self.logger.debug(f"Promoted to local cache: {cache_key}")
    
    async def _evict_local_cache_entries(self):
        """Evict least recently used entries from local cache"""
        if len(self.local_cache) < self.max_local_cache_size:
            return
        
        # Sort by last accessed time and data quality
        entries = [(key, entry) for key, entry in self.local_cache.items()]
        entries.sort(key=lambda x: (x[1].last_accessed, x[1].data_quality_score))
        
        # Remove bottom 20% of entries
        evict_count = max(1, len(entries) // 5)
        for i in range(evict_count):
            key = entries[i][0]
            del self.local_cache[key]
            self.cache_stats['evictions'] += 1
        
        self.logger.debug(f"Evicted {evict_count} entries from local cache")
    
    async def _update_redis_stats(self, cache_key: str, cache_type: str, entry: CacheEntry):
        """Update access statistics in Redis"""
        if not self.redis_client:
            return
        
        try:
            # Update the cached entry with new stats
            entry_dict = {
                'data': entry.data,
                'cached_at': entry.cached_at.isoformat(),
                'expires_at': entry.expires_at.isoformat(),
                'access_count': entry.access_count,
                'last_accessed': entry.last_accessed.isoformat(),
                'source': entry.source,
                'data_quality_score': entry.data_quality_score,
                'cache_tags': entry.cache_tags
            }
            
            # Only update if key still exists
            if await self.redis_client.exists(f"atlas:{cache_type}:{cache_key}"):
                await self.redis_client.set(
                    f"atlas:{cache_type}:{cache_key}",
                    json.dumps(entry_dict, default=str)
                )
        except Exception as e:
            self.logger.warning(f"Failed to update Redis stats: {e}")
    
    async def invalidate_by_tags(self, tags: List[str]):
        """Invalidate cache entries by tags"""
        if not self.redis_client:
            return
        
        try:
            for tag in tags:
                # Get all cache keys with this tag
                cache_keys = await self.redis_client.smembers(f"atlas:tag:{tag}")
                
                # Delete cache entries
                for cache_key in cache_keys:
                    await self.redis_client.delete(f"atlas:{cache_key}")
                
                # Delete tag set
                await self.redis_client.delete(f"atlas:tag:{tag}")
                
                self.logger.info(f"Invalidated {len(cache_keys)} entries with tag: {tag}")
        except Exception as e:
            self.logger.error(f"Cache invalidation failed: {e}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        stats = {
            'hit_rate_percent': round(hit_rate, 2),
            'total_requests': total_requests,
            'local_cache_size': len(self.local_cache),
            'max_local_cache_size': self.max_local_cache_size,
            **self.cache_stats
        }
        
        # Add Redis stats if available
        if self.redis_client:
            try:
                redis_info = await self.redis_client.info('memory')
                stats['redis_memory_mb'] = round(redis_info['used_memory'] / 1024 / 1024, 2)
                stats['redis_connected'] = True
            except Exception:
                stats['redis_connected'] = False
        else:
            stats['redis_connected'] = False
        
        return stats

class AdaptiveRateLimiter:
    """
    Intelligent rate limiter that adapts to platform responses and success rates
    """
    
    def __init__(self):
        self.platform_configs = {
            'funda.nl': RateLimitConfig(
                platform='funda.nl',
                max_requests_per_minute=15,
                max_requests_per_hour=300,
                max_requests_per_day=2000,
                burst_allowance=5,
                cooldown_seconds=30
            ),
            'idealista.com': RateLimitConfig(
                platform='idealista.com',
                max_requests_per_minute=10,
                max_requests_per_hour=200,
                max_requests_per_day=1500,
                burst_allowance=3,
                cooldown_seconds=45
            ),
            'fotocasa.es': RateLimitConfig(
                platform='fotocasa.es',
                max_requests_per_minute=12,
                max_requests_per_hour=250,
                max_requests_per_day=1800,
                burst_allowance=4,
                cooldown_seconds=40
            ),
            'habitaclia.com': RateLimitConfig(
                platform='habitaclia.com',
                max_requests_per_minute=8,
                max_requests_per_hour=150,
                max_requests_per_day=1000,
                burst_allowance=2,
                cooldown_seconds=60
            )
        }
        
        # Request tracking
        self.request_history = defaultdict(lambda: {
            'minute': deque(maxlen=100),
            'hour': deque(maxlen=1000),
            'day': deque(maxlen=5000)
        })
        
        # Adaptive adjustments
        self.success_rates = defaultdict(lambda: deque(maxlen=100))
        self.response_times = defaultdict(lambda: deque(maxlen=50))
        self.blocked_until = defaultdict(lambda: None)
        
        self.logger = logging.getLogger(__name__)
    
    def _get_platform(self, url: str) -> str:
        """Extract platform from URL"""
        for platform in self.platform_configs.keys():
            if platform in url:
                return platform
        return 'unknown'
    
    async def can_make_request(self, url: str, priority: str = 'normal') -> tuple[bool, Optional[int]]:
        """
        Check if request can be made based on rate limits
        Returns (can_proceed, wait_seconds)
        """
        platform = self._get_platform(url)
        if platform not in self.platform_configs:
            return True, None  # No limits for unknown platforms
        
        config = self.platform_configs[platform]
        now = time.time()
        
        # Check if platform is temporarily blocked
        if self.blocked_until[platform] and now < self.blocked_until[platform]:
            wait_seconds = int(self.blocked_until[platform] - now)
            return False, wait_seconds
        
        history = self.request_history[platform]
        
        # Apply priority multipliers
        multiplier = 1.5 if priority == 'high' else 0.8 if priority == 'low' else 1.0
        
        # Check minute limit
        minute_requests = len([t for t in history['minute'] if now - t < 60])
        minute_limit = int(config.max_requests_per_minute * multiplier)
        
        if minute_requests >= minute_limit:
            return False, 60
        
        # Check hour limit
        hour_requests = len([t for t in history['hour'] if now - t < 3600])
        hour_limit = int(config.max_requests_per_hour * multiplier)
        
        if hour_requests >= hour_limit:
            return False, 300  # Wait 5 minutes
        
        # Check day limit
        day_requests = len([t for t in history['day'] if now - t < 86400])
        day_limit = int(config.max_requests_per_day * multiplier)
        
        if day_requests >= day_limit:
            return False, 3600  # Wait 1 hour
        
        # Adaptive rate limiting based on success rate
        success_rate = self._get_success_rate(platform)
        if success_rate < 0.5:  # Less than 50% success rate
            # Reduce rate by 50%
            if minute_requests >= minute_limit * 0.5:
                return False, 120  # Wait 2 minutes
        
        return True, None
    
    async def record_request(self, url: str, success: bool, response_time: float = None):
        """Record request for rate limiting and adaptation"""
        platform = self._get_platform(url)
        if platform not in self.platform_configs:
            return
        
        now = time.time()
        history = self.request_history[platform]
        
        # Record request timestamps
        history['minute'].append(now)
        history['hour'].append(now)
        history['day'].append(now)
        
        # Record success/failure for adaptive limiting
        self.success_rates[platform].append(success)
        
        if response_time:
            self.response_times[platform].append(response_time)
        
        # Adapt rate limits based on performance
        await self._adapt_rate_limits(platform)
        
        self.logger.debug(f"Recorded request for {platform}: success={success}, response_time={response_time}")
    
    async def record_blocking(self, url: str, blocked_for_seconds: int = None):
        """Record that platform is temporarily blocking requests"""
        platform = self._get_platform(url)
        if platform not in self.platform_configs:
            return
        
        # Auto-detect blocking duration or use provided value
        block_duration = blocked_for_seconds or self.platform_configs[platform].cooldown_seconds
        
        # Apply exponential backoff for repeated blocks
        current_block = self.blocked_until.get(platform)
        if current_block and time.time() < current_block:
            block_duration *= 2  # Double the wait time
        
        self.blocked_until[platform] = time.time() + block_duration
        
        self.logger.warning(f"Platform {platform} blocked for {block_duration} seconds")
    
    async def _adapt_rate_limits(self, platform: str):
        """Adapt rate limits based on success rates and response times"""
        if platform not in self.platform_configs:
            return
        
        config = self.platform_configs[platform]
        success_rate = self._get_success_rate(platform)
        avg_response_time = self._get_avg_response_time(platform)
        
        # Adaptive adjustments
        if success_rate < 0.7:  # Less than 70% success
            # Reduce limits by 20%
            config.priority_multiplier = max(0.5, config.priority_multiplier * 0.8)
            self.logger.info(f"Reduced rate limits for {platform} due to low success rate: {success_rate:.2f}")
        
        elif success_rate > 0.95 and avg_response_time < 2.0:  # High success, fast responses
            # Increase limits by 10%
            config.priority_multiplier = min(2.0, config.priority_multiplier * 1.1)
            self.logger.info(f"Increased rate limits for {platform} due to good performance")
        
        # Reset multiplier towards 1.0 over time
        if config.priority_multiplier != 1.0:
            config.priority_multiplier += (1.0 - config.priority_multiplier) * 0.1
    
    def _get_success_rate(self, platform: str) -> float:
        """Calculate recent success rate for platform"""
        if platform not in self.success_rates or not self.success_rates[platform]:
            return 1.0
        
        recent_results = list(self.success_rates[platform])[-20:]  # Last 20 requests
        return sum(recent_results) / len(recent_results)
    
    def _get_avg_response_time(self, platform: str) -> float:
        """Calculate average response time for platform"""
        if platform not in self.response_times or not self.response_times[platform]:
            return 1.0
        
        recent_times = list(self.response_times[platform])[-10:]  # Last 10 requests
        return sum(recent_times) / len(recent_times)
    
    async def get_rate_limit_stats(self) -> Dict[str, Any]:
        """Get rate limiting statistics"""
        stats = {}
        now = time.time()
        
        for platform, config in self.platform_configs.items():
            history = self.request_history[platform]
            
            minute_requests = len([t for t in history['minute'] if now - t < 60])
            hour_requests = len([t for t in history['hour'] if now - t < 3600])
            day_requests = len([t for t in history['day'] if now - t < 86400])
            
            success_rate = self._get_success_rate(platform)
            avg_response_time = self._get_avg_response_time(platform)
            
            blocked_until = self.blocked_until.get(platform)
            is_blocked = blocked_until and now < blocked_until
            
            stats[platform] = {
                'requests_last_minute': minute_requests,
                'requests_last_hour': hour_requests,
                'requests_last_day': day_requests,
                'limits': {
                    'minute': config.max_requests_per_minute,
                    'hour': config.max_requests_per_hour,
                    'day': config.max_requests_per_day
                },
                'success_rate': round(success_rate, 3),
                'avg_response_time': round(avg_response_time, 2),
                'is_blocked': is_blocked,
                'blocked_until': blocked_until,
                'priority_multiplier': round(config.priority_multiplier, 2)
            }
        
        return stats

class RequestOptimizer:
    """
    Optimizes scraping requests by batching, queuing, and intelligent scheduling
    """
    
    def __init__(self, cache: IntelligentCache, rate_limiter: AdaptiveRateLimiter):
        self.cache = cache
        self.rate_limiter = rate_limiter
        self.request_queue = defaultdict(list)  # Platform -> list of requests
        self.processing = False
        self.logger = logging.getLogger(__name__)
    
    async def add_request(self, 
                         url: str, 
                         callback: Callable, 
                         priority: str = 'normal',
                         cache_key_components: Dict[str, Any] = None) -> str:
        """Add request to optimization queue"""
        platform = self._get_platform(url)
        
        request_id = hashlib.sha256(f"{url}{time.time()}".encode()).hexdigest()[:12]
        
        # Check cache first
        if cache_key_components:
            cached_result = await self.cache.get(cache_key_components)
            if cached_result:
                self.logger.info(f"Request {request_id} served from cache")
                await callback(cached_result.data)
                return request_id
        
        # Add to queue
        request_item = {
            'id': request_id,
            'url': url,
            'callback': callback,
            'priority': priority,
            'added_at': time.time(),
            'cache_key_components': cache_key_components
        }
        
        self.request_queue[platform].append(request_item)
        
        # Sort by priority
        self.request_queue[platform].sort(
            key=lambda x: (
                0 if x['priority'] == 'high' else 1 if x['priority'] == 'normal' else 2,
                x['added_at']
            )
        )
        
        # Start processing if not already running
        if not self.processing:
            asyncio.create_task(self._process_queue())
        
        self.logger.info(f"Added request {request_id} to {platform} queue (priority: {priority})")
        return request_id
    
    async def _process_queue(self):
        """Process queued requests with intelligent scheduling"""
        self.processing = True
        
        try:
            while any(self.request_queue.values()):
                # Find next request to process
                request_item = None
                platform = None
                
                # Check each platform for available requests
                for plt, queue in self.request_queue.items():
                    if not queue:
                        continue
                    
                    can_proceed, wait_seconds = await self.rate_limiter.can_make_request(
                        queue[0]['url'], 
                        queue[0]['priority']
                    )
                    
                    if can_proceed:
                        request_item = queue.pop(0)
                        platform = plt
                        break
                
                if not request_item:
                    # No requests can be processed right now, wait and retry
                    await asyncio.sleep(5)
                    continue
                
                # Process the request
                await self._execute_request(request_item, platform)
                
                # Small delay between requests
                await asyncio.sleep(1)
        
        finally:
            self.processing = False
    
    async def _execute_request(self, request_item: Dict[str, Any], platform: str):
        """Execute a single request with error handling"""
        start_time = time.time()
        
        try:
            # Execute the callback (actual scraping)
            result = await request_item['callback'](request_item['url'])
            
            response_time = time.time() - start_time
            success = result is not None and not isinstance(result, Exception)
            
            # Record request for rate limiting
            await self.rate_limiter.record_request(
                request_item['url'], 
                success, 
                response_time
            )
            
            # Cache successful results
            if success and request_item['cache_key_components']:
                await self.cache.set(
                    request_item['cache_key_components'],
                    result,
                    data_quality_score=getattr(result, 'data_quality_score', 75.0)
                )
            
            self.logger.info(f"Completed request {request_item['id']} in {response_time:.2f}s")
            
        except Exception as e:
            response_time = time.time() - start_time
            
            # Record failed request
            await self.rate_limiter.record_request(request_item['url'], False, response_time)
            
            # Check if it's a rate limiting error
            if 'rate limit' in str(e).lower() or 'too many requests' in str(e).lower():
                await self.rate_limiter.record_blocking(request_item['url'])
            
            self.logger.error(f"Request {request_item['id']} failed: {e}")
    
    def _get_platform(self, url: str) -> str:
        """Extract platform from URL"""
        platforms = ['funda.nl', 'idealista.com', 'fotocasa.es', 'habitaclia.com']
        for platform in platforms:
            if platform in url:
                return platform
        return 'unknown'
    
    async def get_queue_stats(self) -> Dict[str, Any]:
        """Get queue statistics"""
        stats = {
            'total_queued': sum(len(queue) for queue in self.request_queue.values()),
            'processing': self.processing,
            'platforms': {}
        }
        
        for platform, queue in self.request_queue.items():
            if queue:
                priorities = defaultdict(int)
                ages = []
                
                for item in queue:
                    priorities[item['priority']] += 1
                    ages.append(time.time() - item['added_at'])
                
                stats['platforms'][platform] = {
                    'queued_requests': len(queue),
                    'priorities': dict(priorities),
                    'avg_age_seconds': round(sum(ages) / len(ages), 2) if ages else 0,
                    'oldest_request_seconds': round(max(ages), 2) if ages else 0
                }
        
        return stats

# Integration class that combines all components
class OptimizedScrapingManager:
    """
    Main manager that coordinates caching, rate limiting, and request optimization
    """
    
    def __init__(self, redis_url: str = None):
        self.cache = IntelligentCache(redis_url)
        self.rate_limiter = AdaptiveRateLimiter()
        self.request_optimizer = RequestOptimizer(self.cache, self.rate_limiter)
        self.logger = logging.getLogger(__name__)
    
    async def start(self):
        """Initialize all components"""
        await self.cache.start()
        self.logger.info("Optimized scraping manager started")
    
    async def close(self):
        """Close all components"""
        await self.cache.close()
        self.logger.info("Optimized scraping manager closed")
    
    async def scrape_with_optimization(self, 
                                     url: str, 
                                     scraper_function: Callable,
                                     priority: str = 'normal',
                                     cache_tags: List[str] = None) -> Any:
        """
        Main method to scrape with full optimization
        """
        # Generate cache key
        cache_key_components = {
            'url': url,
            'scraper': scraper_function.__name__,
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        
        # Try cache first
        cached_result = await self.cache.get(cache_key_components, 'property_analysis')
        if cached_result:
            self.logger.info(f"Serving from cache: {url}")
            return cached_result.data
        
        # Check rate limits
        can_proceed, wait_seconds = await self.rate_limiter.can_make_request(url, priority)
        if not can_proceed:
            if priority == 'high':
                # For high priority requests, wait and then proceed
                self.logger.info(f"High priority request waiting {wait_seconds}s for: {url}")
                await asyncio.sleep(wait_seconds)
            else:
                # Add to queue for later processing
                future = asyncio.Future()
                
                async def callback(result):
                    future.set_result(result)
                
                await self.request_optimizer.add_request(
                    url, callback, priority, cache_key_components
                )
                
                return await future
        
        # Execute request directly
        start_time = time.time()
        try:
            result = await scraper_function(url)
            response_time = time.time() - start_time
            success = result is not None
            
            # Record request
            await self.rate_limiter.record_request(url, success, response_time)
            
            # Cache result
            if success:
                data_quality_score = getattr(result, 'data_quality_score', 75.0)
                await self.cache.set(
                    cache_key_components,
                    result,
                    'property_analysis',
                    cache_tags,
                    data_quality_score,
                    priority
                )
            
            return result
            
        except Exception as e:
            response_time = time.time() - start_time
            await self.rate_limiter.record_request(url, False, response_time)
            
            if 'rate limit' in str(e).lower():
                await self.rate_limiter.record_blocking(url)
            
            raise e
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics"""
        return {
            'cache_stats': await self.cache.get_cache_stats(),
            'rate_limit_stats': await self.rate_limiter.get_rate_limit_stats(),
            'queue_stats': await self.request_optimizer.get_queue_stats(),
            'timestamp': datetime.now().isoformat()
        }

# Example usage
async def test_optimized_scraping():
    """Test the optimized scraping system"""
    manager = OptimizedScrapingManager()
    await manager.start()
    
    # Mock scraper function
    async def mock_scraper(url: str):
        await asyncio.sleep(1)  # Simulate scraping time
        return {'url': url, 'data': 'scraped_data', 'data_quality_score': 85.0}
    
    try:
        # Test multiple requests
        urls = [
            'https://www.funda.nl/koop/amsterdam/appartement-1/',
            'https://www.funda.nl/koop/amsterdam/appartement-2/',
            'https://www.idealista.com/inmueble/1/',
            'https://www.idealista.com/inmueble/2/'
        ]
        
        tasks = []
        for url in urls:
            task = manager.scrape_with_optimization(
                url, 
                mock_scraper,
                priority='normal',
                cache_tags=['property', 'test']
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
        print("Scraping Results:")
        for i, result in enumerate(results):
            print(f"  {urls[i]}: {result}")
        
        # Print system stats
        stats = await manager.get_system_stats()
        print("\nSystem Statistics:")
        print(json.dumps(stats, indent=2, default=str))
        
    finally:
        await manager.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_optimized_scraping())