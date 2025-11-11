all: appserver appserver-coarse

appserver: appserver.c Bank.c Bank.h
	gcc -pthread -Wall -g -o appserver appserver.c Bank.c

appserver-coarse: appserver-coarse.c Bank.c Bank.h
	gcc -pthread -Wall -g -o appserver-coarse appserver-coarse.c Bank.c

clean:
	rm -f appserver appserver-coarse *.o test_*.txt