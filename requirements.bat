@echo off
echo Installing Project Atlas dependencies...

echo.
echo Setting up frontend...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing frontend dependencies
    exit /b %ERRORLEVEL%
)

echo Installing UI component dependencies...
call npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge geist
if %ERRORLEVEL% neq 0 (
    echo Error installing UI component dependencies
    exit /b %ERRORLEVEL%
)

echo.
echo Setting up backend...
cd ../backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing backend dependencies
    exit /b %ERRORLEVEL%
)

echo.
echo Setting up database...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo Error generating Prisma client
    exit /b %ERRORLEVEL%
)

echo.
echo Starting servers...
start cmd /k "cd ../backend && npm run dev"
start cmd /k "cd ../frontend && npm run dev"

echo.
echo Project Atlas setup complete!
echo.
echo Backend running at: http://localhost:5000
echo Frontend running at: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul

cd C:\Users\Davino\Desktop\Atlas\backend
npx prisma migrate dev --name init

cd frontend
npx shadcn-ui@latest add button
npm install geist
