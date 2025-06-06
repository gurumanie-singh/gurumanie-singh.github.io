main:

addiu $1, $0, 5 # move 5 into $1

j jump

add $2 $0, 5

jump:

add $2, $2, 5
add $3, $0, 5
nop
nop
nop

beq $3, $2, jump

exit:
	halt

