FROM debian:bookworm-slim

ARG TARGETARCH

RUN apt-get update && apt-get install -y ca-certificates curl unzip && rm -rf /var/lib/apt/lists/*

WORKDIR /pb_data

RUN if [ "$TARGETARCH" = "amd64" ]; then \
  PB_ARCH="linux_amd64"; \
  elif [ "$TARGETARCH" = "arm64" ]; then \
  PB_ARCH="linux_arm64"; \
  else \
  echo "Unsupported architecture: $TARGETARCH"; exit 1; \
  fi && \
  curl -L -o pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.23.2/pocketbase_0.23.2_${PB_ARCH}.zip && \
  unzip pocketbase.zip && \
  chmod +x pocketbase && \
  rm pocketbase.zip

COPY init-pocketbase.sh /usr/local/bin/init-pocketbase.sh
RUN chmod +x /usr/local/bin/init-pocketbase.sh

EXPOSE 8090

VOLUME ["/pb_data"]

CMD ["/bin/sh", "-c", "./pocketbase serve --http=0.0.0.0:8090 & sleep 10 && /usr/local/bin/init-pocketbase.sh; wait"]
