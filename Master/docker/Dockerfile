FROM debian:7.6
MAINTAINER https://github.com/pihizi

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update

# Install cURL
RUN apt-get install -y curl apt-utils

# Install NodeJS
RUN (curl -sL https://deb.nodesource.com/setup | bash -) && \
    apt-get install -y nodejs && \
    npm install -g debade-master

ADD etc/debade/debade.conf /etc/debade/debade.conf

CMD ["/usr/bin/debade-master"]
