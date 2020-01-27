import sys
def main(a,b):
	print(a)
	print(b)

if __name__=='__main__':
	a, b=sys.argv[1:]
	main(a,b)