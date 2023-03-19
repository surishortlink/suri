FROM ubuntu:22.04
LABEL maintainer="Max Kratz <account@maxkratz.com>"
ENV DEBIAN_FRONTEND=noninteractive \
    UID="${UID:-1000}" \
    GID="${GID:-1000}"

# Output user- and groupid
RUN echo "Using UID $UID and GID $GID."

# Create group and user
RUN groupadd -f -g $GID appgroup
RUN useradd -r -u $UID -g $GID appuser

# Update and install various packages
RUN apt-get update -q && \
    apt-get upgrade -yq && \
    apt-get install -yq lsb-release locales bash-completion tzdata apt-utils curl

# Use en utf8 locales
RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Install nodejs in version 12.x
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt install nodejs

# Show versions for verifying the installation
RUN node -v
RUN npm -v

# Create and copy app and data folder
RUN mkdir -p /app
RUN mkdir -p /data

COPY ./ /app/
WORKDIR /app

# Install app specific packages
RUN npm install

# The command to run the site build in /app
CMD cp -R /data /app && npm run build && cp -R /app/_site /data/ && chown -R $UID:$GID /data/_site
