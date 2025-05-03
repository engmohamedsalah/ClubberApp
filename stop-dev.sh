#!/bin/bash

# Print colorful header
echo -e "\033[1;36m========== STOPPING CLUBBER APP DEVELOPMENT SERVERS ==========\033[0m"

# Stop .NET backend server
if [ -f backend/.backend.pid ]; then
    BACKEND_PID=$(cat backend/.backend.pid)
    echo -e "\033[1;33mStopping .NET backend server (PID: $BACKEND_PID)...\033[0m"
    kill -15 $BACKEND_PID 2>/dev/null || echo "Backend server was not running."
    rm backend/.backend.pid
else
    echo -e "\033[1;33mNo backend PID file found. Server might not be running.\033[0m"
fi

# Stop Angular frontend server
if [ -f frontend/.frontend.pid ]; then
    FRONTEND_PID=$(cat frontend/.frontend.pid)
    echo -e "\033[1;33mStopping Angular frontend server (PID: $FRONTEND_PID)...\033[0m"
    kill -15 $FRONTEND_PID 2>/dev/null || echo "Frontend server was not running."
    rm frontend/.frontend.pid
else
    echo -e "\033[1;33mNo frontend PID file found. Server might not be running.\033[0m"
fi

# Additionally, try to find and kill any other related processes
echo -e "\033[1;33mChecking for remaining processes...\033[0m"

# Kill any Angular CLI processes with different possible commands
pkill -f "ng serve" 2>/dev/null && echo "Killed Angular CLI processes." || echo "No Angular CLI processes found."
pkill -f "npm run start" 2>/dev/null && echo "Killed npm Angular processes." || echo "No npm Angular processes found."

# Kill any .NET processes related to our app
pkill -f "dotnet.*ClubberApp.Api.dll" 2>/dev/null && echo "Killed .NET processes." || echo "No .NET processes found."
pkill -f "dotnet.*ClubberApp.Api.exe" 2>/dev/null && echo "Killed .NET processes." || echo "No .NET processes found."

echo -e "\033[1;32mAll development servers stopped!\033[0m" 