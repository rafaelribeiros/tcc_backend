FROM node:8

WORKDIR /home/user/civita

COPY src src/
COPY yarn.lock .babelrc package.json ./

RUN adduser --disabled-password --gecos "" user
RUN chown -R user /home/user
RUN chown -R user /usr/local

USER user

RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN ~/.yarn/bin/yarn
RUN ~/.yarn/bin/yarn build

EXPOSE 3000

CMD ~/.yarn/bin/yarn start
