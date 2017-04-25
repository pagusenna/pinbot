FROM node:7.6.0
MAINTAINER Pagu Senna <pagusenna@gmail.com>

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV APP_HOME /app

RUN mkdir $APP_HOME
WORKDIR $APP_HOME

ADD package.json $APP_HOME

RUN npm install --production

COPY . $APP_HOME

CMD ["node", "/app/index.js"]
