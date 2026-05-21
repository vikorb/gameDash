FROM alpine:latest

RUN apk add --no-cache ca-certificates curl unzip dos2unix

WORKDIR /app

RUN curl -L -o pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.23.2/pocketbase_0.23.2_linux_amd64.zip && \
  unzip pocketbase.zip && \
  chmod +x pocketbase && \
  rm pocketbase.zip

COPY init-pocketbase.sh /app/init-pocketbase.sh
RUN dos2unix /app/init-pocketbase.sh && chmod +x /app/init-pocketbase.sh

EXPOSE 8090

VOLUME ["/pb_data"]

CMD ["/bin/sh", "-c", "./pocketbase serve --dir=/pb_data --http=0.0.0.0:8090 & sleep 10 && ./init-pocketbase.sh; wait"]
