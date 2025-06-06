main:

addiu $t0, $0, 0	# i =0
bne $t0, $0, branch2
jal function1
j exit

function1:
	
	addiu $sp, $sp, -4
	sw $ra, 0($sp)
	jal function2
	lw $ra, 0($sp)
	addiu $sp, $sp, 4
	jr $ra

function2:
	
	addiu $sp, $sp, -4
	sw $ra, 0($sp)
	jal function3
	lw $ra, 0($sp)
	addiu $sp, $sp, 4
	jr $ra


function3:

	addiu $sp, $sp, -4
	sw $ra, 0($sp)
	jal function4
	lw $ra, 0($sp)
	addiu $sp, $sp, 4
	jr $ra


function4:

	addiu $sp, $sp, -4
	sw $ra, 0($sp)
	jal function5
	lw $ra, 0($sp)
	addiu $sp, $sp, 4
	jr $ra


function5:

	beq $t0, $0, branch1
	jr $ra

branch1:
	addiu $t0, $t0, 1
	j function5
	
branch2:
	addiu $t0, $t0, 1
	j main

exit:
	halt

