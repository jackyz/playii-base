all:

clean:
	rm -rf playii-base.tar.gz

dist: all
	find . -type f \
	| grep -v "~" | grep -v .gitignore | grep -v .git | grep -v Makefile \
	| xargs tar -cvzf playii-base.tar.gz

