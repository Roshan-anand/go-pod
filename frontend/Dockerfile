# ARG VITE_BACKEND_URL
# ARG VITE_BACKEND_WS_URL

# FROM node:22-alpine AS builder

# WORKDIR /client

# ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
# ENV VITE_BACKEND_WS_URL=$VITE_BACKEND_WS_URL

# COPY package.json package.json
# COPY pnpm-lock.yaml pnpm-lock.yaml

# RUN npm install -g pnpm
# RUN pnpm install

# COPY . .
# RUN pnpm build

# FROM nginx:latest AS runner

# COPY  --from=builder /client/nginx.conf /etc/nginx
# COPY --from=builder /client/dist /usr/share/nginx/html

# EXPOSE 80
# CMD [ "nginx", "-g", "daemon off;" ]


FROM node:22-alpine AS builder

WORKDIR /client

ARG BACKEND_URL
ARG BACKEND_WS_URL

ENV VITE_BACKEND_URL=$BACKEND_URL
ENV VITE_BACKEND_WS_URL=$BACKEND_WS_URL

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml

RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build

CMD [ "pnpm", "preview", "--port", "5173", "--host", "0.0.0.0" ]
# CMD [ "pnpm","dev", "--host", "0.0.0.0" ]