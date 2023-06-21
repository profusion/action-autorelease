# Auto Release

This script enables the automatic creation of GitHub releases when a specific property in a properties file changes. It can be useful for publishing packages automatically when certain properties, such as version numbers, change.


## Usage
The following is an example .github/workflows/main.yml that will execute when a push to the main branch occurs.

## Usage

The following is an example `.github/workflows/main.yml` that will execute when a `push` to the `main` branch occurs.

```yaml
name: Auto Release

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v3
        - uses: profusion/autorelease@main
            with:
            properties_path: "gradle.properties"
            property_name: "VERSION_NAME"
            tag_prefix: "v"
            github_token: ${{ secrets.GITHUB_TOKEN }}
```

To make this work, the workflow must have the checkout action _before_ the autotag action.

This **order** is important!

```yaml
- uses: actions/checkout@v3
- uses: profusion/action-autotag@main
```

> If the repository is not checked out first, the script cannot find the properties file.

### Configurations

1. `github_token`: This is the token used to create the tag. It is required.

2. `properties_path`: This is the path to the properties file. It is required.

3. `property_name`: This is the name of the property that will be used to create the tag. It is required.

4. `tag_prefix`: A prefix can be used to add text before the tag name. For example, if `tag_prefix` is set to `v`, then the tag would be labeled as `v1.0.0`.

5. `tag_suffix`: Text can also be applied to the end of the tag by setting `tag_suffix`. For example, if `tag_suffix` is ` (beta)`, the tag would be `1.0.0 (beta)`.
