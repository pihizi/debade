dockerfile-debade-master
========================

    docker pull pihizi/debade-master
    docker run --name pihizi-debade-master \
        --restart always \
        --dns 172.17.42.1 \
        -v /dev/log:/dev/log \
        -d pihizi/debade-master
