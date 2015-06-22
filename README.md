# Metal Forge

- Listens for webhooks from Contentful and Git (HAPI)
-- Retrieves content and media from Contentful
-- Pulls latest build code from Git
-- Starts build process
- Serves Static Site (HAPI)

# Config
`./config.json` is required for connecting to contentful.  Not included in repo for security.  Example:
```json
{
	"contentful": {
		"space": "{your_space_here}",
		"accessToken": "{your_key_here}",
		"spaces": {
			"{name_of_space}": {
				"id": "{your_space_here}",
				"location_to_store": "./store/",
				"content_types": {
					"posts": "{content_type_id}",
					"author": "{content_type_id}"
				}
			}
		}
	}
}
```