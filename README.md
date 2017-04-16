# argon-aframe

A collection of components, entities and systems to integrate [A-Frame](https://aframe.io) with [argon.js](http://argonjs.io/), so augmented reality content for the Argon web browser can be created with A-Frame.

## A note about using https for development

More and more, modern web browsers demand that you use https:// instead of http://.  You cannot, for example, use the web location APIs, or access video via WebRTC, over http connections on many browsers. If you want to do development using https and node.js use the _devssl_ target (used by doing `npm run devssl`).

## Documentation

To see documentation of the collection of Entities and Components that link Argon and AFrame, see the [API Documentation](API.md).

## Builds

To use the latest stable build of Argon-AFrame, include [`argon-aframe.min.js`](https://rawgit.com/argonjs/argon-aframe/master/dist/argon-aframe.js):

```js
<head>
  <script src="https://rawgit.com/argonjs/argon-aframe/master/dist/argon-aframe.js"></script>
</head>
```

To check out the stable and master builds, see the [`dist/` folder](dist/).

## Local Development

```sh
git clone https://github.com/argonjs/argon-aframe.git  # Clone the repository.
cd argon-aframe && npm install  # Install dependencies.
npm run devsite # update build.js and genereate a local development site in _sites
npm run dev  # Start the local development server.
```

And open in your browser **[http://localhost:8001](http://localhost:8001)**.

When you change the HTML files, you need to regenerate _site with `npm run devsite`.  

### Generating Builds

```sh
npm run dist
```

## Questions

For questions and support, [ask on one of our support channels](https://www.argonjs.io/#develop).

## Stay in Touch

- To hang out with the community, join the argonjs slack ([see the slack-join link in our developer support links]](https://www.argonjs.io/#develop)).
- [Follow @argonjs on Twitter](https://twitter.com/argonjs).

## Contributing

Get involved! Check out the [Contributing Guide](CONTRIBUTING.md) for how to get started.

## License

This program is free software and is distributed under an [Apache License](LICENSE).
