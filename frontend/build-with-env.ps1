# Set Clerk environment variables
$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_aW1tdW5lLW1hZ2dvdC02OC5jbGVyay5hY2NvdW50cy5kZXYk"
$env:CLERK_SECRET_KEY = "sk_test_svyAlbynCEIlll0g5a19TPJuG6Cn7XSJ1ARFh6JMD5"

# Run the build command
Write-Host "Building with Clerk environment variables set..."
npm run build 