main:
    addiu $t0, $0, 0
    beq $t0, $0, test_beq
    j test_j

test_beq:
    addiu $t0, $t0, 1
    bne $t0, $0, test_bne
    j exit

test_bne:
    addiu $t1, $0, 2
    beq $t0, $t1, test_comb1
    j exit

test_j:
    addiu $t2, $0, 3
    j test_j_target

test_j_target:
    addiu $t2, $t2, 1
    jal test_jal
    j exit

test_jal:
    addiu $sp, $sp, -4
    sw $ra, 0($sp)
    jal test_nested
    lw $ra, 0($sp)
    addiu $sp, $sp, 4
    jr $ra

test_nested:
    addiu $sp, $sp, -4
    sw $ra, 0($sp)
    jal test_jr
    lw $ra, 0($sp)
    addiu $sp, $sp, 4
    jr $ra

test_jr:
    move $t3, $ra
    jr $t3

test_comb1:
    addiu $t4, $0, 0
    beq $t4, $0, test_comb2
    j exit

test_comb2:
    addiu $t4, $t4, 1
    bne $t4, $0, test_comb3
    j exit

test_comb3:
    jal test_comb4
    j exit

test_comb4:
    beq $t4, $t4, test_comb5
    jr $ra

test_comb5:
    j test_comb6

test_comb6:
    jal test_comb7

test_comb7:
    jr $ra

exit:
    halt

