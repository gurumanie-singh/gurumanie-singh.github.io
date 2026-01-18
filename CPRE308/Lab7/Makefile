all: bsdump fat12ls

bsdump: bsdump-template.c
	gcc bsdump-template.c -o bsdump

fat12ls: fat12ls-template.c
	gcc fat12ls-template.c -o fat12ls

clean:
	rm -f bsdump fat12ls

run: bsdump fat12ls
	./bsdump image
	./fat12ls image
