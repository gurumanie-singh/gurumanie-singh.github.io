main:

addiu $t0, $0, 5
nop
nop
nop
addiu $t1, $0, 4
nop
nop
nop
nop
label2:
bne $t1, $t0, label1
nop
nop
nop
j exit

label1:
nop
addiu $t1, $t1, 1
nop
nop
nop
nop
beq $t1, $t0, label2
nop
nop
nop

exit:
halt
