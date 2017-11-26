FROM registry.gitlab.com/novacloud/udi/udi-api:develop

COPY . /code

RUN npm install
