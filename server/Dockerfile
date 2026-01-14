# use python 3.11 slim image
FROM python:3.11-slim

# set working directory
WORKDIR /app

# install system dependencies including netcat for health checks
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# copy requirements file
COPY requirements.txt .

# install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy application code
COPY . .

# make entrypoint script executable
RUN chmod +x entrypoint.sh

# expose port 5000
EXPOSE 5000

# set entrypoint
ENTRYPOINT ["./entrypoint.sh"]
