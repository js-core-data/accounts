FROM registry.gitlab.com/novacloud/udi/udi-api:develop

RUN npm install

COPY . /code