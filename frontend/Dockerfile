FROM node:22-alpine AS builder

WORKDIR /client

ARG VITE_BACKEND_URL
ARG VITE_S3_BUCKET_NAME
ARG VITE_S3_ACCESS_KEY
ARG VITE_S3_SECRET_ACCESS_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_S3_BUCKET_NAME=$VITE_S3_BUCKET_NAME
ENV VITE_S3_ACCESS_KEY=$VITE_S3_ACCESS_KEY
ENV VITE_S3_SECRET_ACCESS_KEY=$VITE_S3_SECRET_ACCESS_KEY

RUN npm install -g pnpm

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install

COPY . .
RUN pnpm build

FROM nginx:latest AS runner

COPY  --from=builder /client/nginx.conf /etc/nginx
COPY --from=builder /client/dist /usr/share/nginx/html

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
