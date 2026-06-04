FROM public.ecr.aws/docker/library/alpine:latest

RUN apk add --no-cache ca-certificates curl unzip dos2unix

WORKDIR /app

COPY pocketbase pocketbase
RUN chmod +x pocketbase

COPY init-pocketbase.sh /app/init-pocketbase.sh
RUN dos2unix /app/init-pocketbase.sh && chmod +x /app/init-pocketbase.sh

EXPOSE 8090

VOLUME ["/pb_data"]

CMD ["/bin/sh", "-c", "./pocketbase serve --dir=/pb_data --http=0.0.0.0:8090 & sleep 10 && ./init-pocketbase.sh; wait"]
