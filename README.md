# vykulakov.github.io website

[vykulakov.github.io](https://vykulakov.github.io) is supposed to be a place
to store any personal notes. So this repository contains just the source code
for the site.

## Development

To work with this project locally install Ruby and Bundler before. To do it on
Ubuntu run the following commands:
```bash
sudo apt install ruby
sudo apt install bundler
```

Then go to the project directory and init the project:
```bash
bundle install
```

And finally, it will be possible to run a local Jekyll server:
```bash
bundle exec jekyll serve
```

Now you can see the site at url http://127.0.0.1:4000/
