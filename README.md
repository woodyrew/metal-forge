# Metal Forge

- Listens for webhooks from Contentful and Git (ExpressJS)
-- Retrieves content and media from Contentful
-- Pulls latest build code from Git
-- Starts build process
- Serves Static Site (ExpressJS)

# Config
`./config.json` is required for connecting to contentful.  Not included in repo for security.  Example:
```json
{
	"contentful": {
		"space": "your_space_here",
		"accessToken": "your_key_here",
		"spaces": {
			"name_of_space": {
				"id": "your_space_here",
				"location_to_store": "./store/",
				"content_types": {
					"posts": "content_type_id",
					"author": "content_type_id"
				}
			}
		}
	},
	"builder": {
		"path": "./builder/",
		"static": "./builder/site",
		"repository": "your_git_repo_address"
	},
	"path_to_webhook": "some_random_string",
	"webhooks": {
		"path_to_relevant_webhook": {
			"name": "Name of Webhook",
			"expected_header": {
				"X-Some-Header": "Expected Content"
			},
			"username": "user1",
			"password": "password1",
			"method": "POST"
		},
		"another_webhook": {
			"name": "Example of minimum config",
			"method": "GET"
		}
	}
}
```

# Using Forever
```bash
$ forever start -c "npm start" ./
```

or
```bash
$ forever start -c "npm start" /path/to/app/dir
```