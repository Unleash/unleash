variable "NODE_VERSION" {
  default = null
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
