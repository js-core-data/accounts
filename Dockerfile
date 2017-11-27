FROM jscoredata/app

COPY . /code

RUN rm -rf node_modules && \
    npm install --only=production

ENTRYPOINT []
CMD ["npm","start"]