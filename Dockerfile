FROM registry.gitlab.com/novacloud/udi/udi-api:develop

COPY . /code

RUN rm package.json && rm package-lock.json && npm install express-oauth-server@2.0.0 js-sha512@0.7.0 jsonwebtoken@8.1.0
