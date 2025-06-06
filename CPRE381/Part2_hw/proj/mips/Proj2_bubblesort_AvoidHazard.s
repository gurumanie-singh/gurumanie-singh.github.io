.data
array: .word 1, 2, 0, 5, 4, 3, 6, 7, 9, 8

.text
.global main
main:

lasw $a0, array     	# &array[0] in $a0
addiu $a1, $0, 10   	# N value 
jal bubbleSort      	# call bubbleSort function
nop                 	# delay slot

j exit
nop                 	# delay slot

bubbleSort:
addiu $t0, $0, 0    	# $t0 = i = 0
nop
addiu $t3, $a1, -1  	# $t3 = n - 1

j cond1
nop                 	# delay slot

loop1:
	j cond2
	nop             	# delay slot

	loop2:
		sll $t4, $t1, 2      # $t4 = j*4
		nop
		nop
		nop
		addu $t5, $a0, $t4   # $t5 = &array[j]
		nop
		nop
		nop
		addiu $t6, $t5, 4    # $t6 = &array[j+1]
		lw $t7, 0($t5)       # $t7 = array[j]
 		nop
		nop
		lw $t8, 0($t6)       # $t8 = array[j+1]
		nop
		nop
		nop
		slt $t9, $t8, $t7    # check if array[j+1] < array[j]
   		nop
  		nop
		nop
		beq $t9, $0, skip    # if not less, skip swap
		nop                 # delay slot

		swap:
			sw $t8, 0($t5)    # arr[j] <= arr[j+1]
			sw $t7, 0($t6)    # arr[j+1] <= arr[j]
			addiu $t2, $0, 1  # swapFlag = 1

		skip:
			addiu $t1, $t1, 1 # j++

	cond2:
		sub $t4, $t3, $t0   # $t4 = n-1-i
  		nop
		nop
		nop
		slt $t4, $t1, $t4   # j < n-1-i
		nop
		nop
		nop
		bne $t4, $0, loop2
		nop                 # delay slot

	beq $t2, $0, endBubble
	nop                      # delay slot

	addiu $t0, $t0, 1    # i++

cond1:
	nop
	nop
	nop
	slt $t4, $t0, $t3    # i < n-1
	nop
	addiu $t2, $0, 0     # $t2 = swapFlag = 0
	addiu $t1, $0, 0     # $t1 = j = 0
	bne $t4, $0, loop1
	nop

endBubble:
jr $ra
nop                      # delay slot

exit:
	halt

