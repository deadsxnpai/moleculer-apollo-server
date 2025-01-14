"use strict";

const { ServiceBroker } = require("moleculer");

const ApiGateway = require("moleculer-web");
const { ApolloService, GraphQLUpload } = require("../../index");

const broker = new ServiceBroker({ logLevel: "info", hotReload: true });

broker.createService({
	name: "files",
	settings: {
		graphql: {
			type: `
                """
                This type describes a File entity.
                """
                type File {
                    filename: String!
                    encoding: String!
                    mimetype: String!
                }
            `,
		},
	},
	actions: {
		hello: {
			graphql: {
				query: "hello: String!",
			},
			handler() {
				return "Hello Moleculer!";
			},
		},
		singleUpload: {
			graphql: {
				mutation: "singleUpload(file: Upload!, other: String): File!",
				fileUploadArg: "file",
			},
			async handler(ctx) {
				const fileChunks = [];
				for await (const chunk of ctx.params) {
					fileChunks.push(chunk);
				}
				const fileContents = Buffer.concat(fileChunks);
				ctx.broker.logger.info("Uploaded File Contents:", fileContents.toString());
				ctx.broker.logger.info("Additional arguments:", ctx.meta.$args);
				return ctx.meta.$fileInfo;
			},
		},
	},
});

broker.createService(ApiGateway);

broker.start().then(async () => {
	broker.repl();
	broker.logger.info("----------------------------------------------------------");
	broker.logger.info("For information about creating a file upload request,");
	broker.logger.info(
		"see https://github.com/jaydenseric/graphql-multipart-request-spec#curl-request"
	);
	broker.logger.info("----------------------------------------------------------");
});
