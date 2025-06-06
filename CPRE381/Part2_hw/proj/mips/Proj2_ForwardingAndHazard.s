.data
value: .word 10
.text
main:
la $t8, value


# Test 1
	addiu $t0, $0, 5
	addiu $t1, $t0, 4

	addiu $t2, $0, 10
	add $t1, $0, $t2

# Test 2
	addiu $t1, $0, 10
	nop
	add $t2, $t3, $t1

	addiu $t3, $0, 10
	nop
	add $t3, $t3, $t1

# Test 3
	Test3:
	slt $t9, $0, $t0
	beq $t9, $0, Test4
	
	label4:
	addiu $t0, $0, -1
	j Test3

# Test 4
	Test4:
	addiu $t1, $0, 5
	nop
	beq $t0, $t1, label0
	addiu $t1, $t1, 5

	label0:
	addiu $t0, $t0, 5

# Test 5
	addiu $t3, $t3, 1
	sw $t3, 0($t8)

# Test 6
	addiu $t2, $t2, 2
	nop	
	sw $t2, 0($t8) 

# Test 7
	lw $t7, 0($t8)
	addiu $t1, $t7, 7

# Test 8
	addiu $t8, $t8, -4
	label5:
	addiu $t8, $t8, 4
	lw $t3, 0($t8)
	beq $t7, $t3, label5

# Test 9
	la $t9, Test10
	sw $t9, 0($t8)
	lw $ra, 0($t8)
	jr $ra
	addiu $t0, $t0, 100
	
# Test 10
	Test10:
	lui $t1, 0x9876
	ori $t2, $t1, 0x5432

# Test 11
	lui $t0, 0x1234
	nop
	ori $t1, $t0, 0x5678

# Test 12
	lui $t3, 0x1111
	sw $t3, 0($t8)

# Test 13
	lui $t4, 0x9999
	nop
	sw $t4, 0($t8)

# Test 14
	Test14:
	lui $t2, 0x2222
	bne $t2, $t9, label14
	j Test15
	
	label14:
	lui $t9, 0x2222
	j Test14

# Test 15
	Test15:
	lui $t5, 0xFFFF
	nop
	bne $t5, $t4, label1
	j Test16

	label1:
	lui $t4, 0xFFFF
 	j Test15

# Test 16
	Test16:
	jal label2

	label2:
	addiu $t2, $ra, 5
	
# Test 17
	#jal label17

# Test 18
	jal label3
	addiu $t5, $t5, 1
	
	label3:
	sw $ra, 0($t8)
	
# Test 19
	addiu $t1, $0, 1
	addiu $t3, $0, 3
	addiu $t0, $0, 0
	
	Test19:
	addiu $t0, $t0, 1
	sub $t4, $t3, $t0   
	slt $t4, $t1, $t4  
	bne $t4, $0, Test19
	addiu $t1, $0, 100
	
# Grendel typa test
	addiu 	$3, $0, 0
	la	$2, value
        sw      $2, 512($sp)
        lw      $2, 512($sp)	# a
        lw      $3, 0($2)	# b
        lw      $2, 256($sp)	# c
        or      $3, $3, $2 	# d
        lw      $2, 512($sp)	# e
        sw      $3, 0($2)	
	
exit:
halt

	#label17:
	#jr $ra
	#addiu $t0, $0, 10 
