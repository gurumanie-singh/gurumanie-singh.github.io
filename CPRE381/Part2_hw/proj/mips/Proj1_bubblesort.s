.data
array: .word 1, 2, 0, 5, 4, 3, 6, 7, 9, 8
.text
.global main
main:

la $a0, array 	# &array[0] in $a0
li $a1, 10	# N value
jal bubbleSort	# call bubbleSort function
j exit


bubbleSort:
addiu $t3, $a1, -1	# $t3 = n - 1
addiu $t0, $0, 0	# $t0 = i = 0
j cond1
	
loop1:
	addiu $t2, $0, 0    # $t2 = swapFlag = 0
	addiu $t1, $0, 0    # $t1 = j = 0
	j cond2

	loop2:
		# if array[j] > array[j+1]
		sll $t4, $t1, 2    	# t4 = j*4
		addu $t5, $a0, $t4 	# t5 = &array[j]
		addiu $t6, $t5, 4 	# t6 = &array[j+1]
		lw $t7, 0($t5)		# t7 = array[j]
		lw $t8, 0($t6)		# t8 = array[j+1]
		slt $t9, $t6, $t5	# arr[j+1] < arr[j]
		bne $t9, $0, skip
			
		swap:
			sw $t8, 0($t5)	  # arr[j] <= arr[j+1]
			sw $t7, 0($t6)	  # arr[j+1] <= arr[j]
			addiu $t2, $0, 1  # swapFlag = 1	
				
		skip:	
		addiu $t1, $t1, 1	# j++

	cond2:
		sub $t4, $t3, $t0   # $t4 = n-1-i
		slt $t4, $t1, $t4   # j < n-1-i
		bne $t4, $0, loop2

	beq $t2, $0, endBubble
	addiu $t0, $t0, 1	# i++
			
cond1:
	slt $t4, $t0, $t3   # i < n-1
	bne $t4, $0, loop1

endBubble:
jr $ra

exit:
	halt
