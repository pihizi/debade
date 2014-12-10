dockerfile-debade
=================

    docker pull pihizi/debade-agent
    docker run --name pihizi-debade-agent \
        --restart always \
        --dns 172.17.42.1 \
        -v /dev/log:/dev/log \
        -v /etc/lib/debade:/etc/lib/debade \
        -p 9191:80 \
        -d pihizi/debade-agent
