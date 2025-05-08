#!/bin/bash

# Print colorful header
echo -e "\033[1;36m========== STARTING CLUBBER APP DEVELOPMENT SERVERS ==========\033[0m"

# Function to check if a port is in use
check_port() {
  lsof -i:$1 > /dev/null 2>&1
  return $?
}

# Check common backend and frontend ports
if check_port 5000 || check_port 5001 || check_port 5008 || check_port 4200; then
  echo -e "\033[1;33mDetected services already running on required ports. Stopping them first...\033[0m"
  ./stop-dev.sh
  # Wait a moment for ports to be released
  sleep 2
fi

# Start .NET backend server
echo -e "\033[1;33mStarting .NET backend server...\033[0m"
cd backend
# Check if dotnet is available
if command -v dotnet &> /dev/null; then
    # Run the API project
    dotnet run --project ClubberApp.Api/ClubberApp.Api.csproj &
    BACKEND_PID=$!
    echo "Backend server started with PID: $BACKEND_PID"
    echo $BACKEND_PID > .backend.pid
else
    echo -e "\033[1;31mError: dotnet command not found. Please install .NET SDK.\033[0m"
    exit 1
fi
cd ..

# Start Angular frontend server
echo -e "\033[1;33mStarting Angular frontend server...\033[0m"
cd frontend
# Use npx ng serve directly without extra flags
npx ng serve &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"
echo $FRONTEND_PID > .frontend.pid
cd ..

echo -e "\033[1;32mBoth servers are now running!\033[0m"
echo -e "\033[1;32mFrontend: http://localhost:4200\033[0m"
echo -e "\033[1;32mBackend: http://localhost:5008 and https://localhost:7130\033[0m"
echo -e "\033[1;31mTo stop the servers, run: ./stop-dev.sh\033[0m"


# Keep the script running to maintain the log output
wait 