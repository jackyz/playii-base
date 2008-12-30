all:

clean:
	rm -rf playii-base.tar.gz

dist: all
	find . -type f \
	| egrep ".html$$|.css$$|.js$$|.gif$$|.jpg$$|.png$$"	\
	| xargs tar -cvzf playii-base.tar.gz

