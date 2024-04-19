####### Base ################
FROM node:alpine3.18 AS base

COPY . ./app

WORKDIR /app

####### Lint ################
FROM base AS lint

RUN npm install -g markdownlint-cli

WORKDIR /app

####### SpellCheck ##########
FROM base AS spellcheck

RUN npm install -g markdown-spellcheck

WORKDIR /app

####### Site Builder ########
FROM base AS site-builder

WORKDIR /app/site

RUN npm install
RUN NODE_ENV=development npm run build

####### Site Server #########
FROM nginx:stable-alpine3.17-slim AS site

# remove existing files from nginx directory
RUN rm -rf /usr/share/nginx/html/*

COPY --from=site-builder /app/site/out /usr/share/nginx/html
COPY --from=site-builder /app/site/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]