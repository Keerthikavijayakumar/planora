## DockerFile

# Client

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Server

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 5000

CMD ["npm", "start"]

- **Container & Image--Build**: docker-compose up --build

## AWS

- **Configure**: aws configure
- **Details**: aws sts get-caller-identity

## ECR Repository 

- **Server**: aws ecr create-repository --repository-name planora-server
- **Client**: aws ecr create-repository --repository-name planora-client

- **Delete**: aws ecr delete-repository  --repository-name planora-client --force

## Docker Login - ECR

- **Pass**: aws ecr get-login-password --region us-east-1 > pass.txt
- **Login**: type pass.txt | docker login --username AWS --password-stdin 232420921471.dkr.ecr.us-east-1.amazonaws.com

## ECR - Docker Setup

- **Tag**: docker tag planora-server:latest 232420921471.dkr.ecr.us-east-1.amazonaws.com/planora-server
- **Push**: docker push 232420921471.dkr.ecr.us-east-1.amazonaws.com/planora-server

## ECR Image List

- **List Image**: aws ecr list-images --repository-name planora-server