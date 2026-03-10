variable "NODE_VERSION" {
  default = "22.22-alpine3.23"
}

target "docker-metadata-action" {}

target "image" {
  inherits = ["docker-metadata-action"]
  context = "."
  dockerfile = "Dockerfile"

  args = {
    NODE_VERSION = NODE_VERSION
  }
}
