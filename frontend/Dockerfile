FROM node:22-alpine AS builder

WORKDIR /client

ENV VITE_NODE_URL=http://localhost:5000
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml

RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build

FROM nginx:latest AS runner

COPY  --from=builder /client/nginx.conf /etc/nginx
COPY --from=builder /client/dist /usr/share/nginx/html

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]