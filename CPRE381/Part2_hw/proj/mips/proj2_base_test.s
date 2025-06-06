.data
arr: .word 1, 2, 0, 5, 4, 3, 6, 7, 9, 8
.text
.global main
main:
    # Testing add
    add $t0, $t1, $t2      

    # Testing addi
    addi $t3, $t4, 10    
    
    # Testing addiu
    addiu $t5, $t6, 20   
    
    # Testing addu
    addu $t7, $t8, $t9    
    
    # Testing sub
    sub $t4, $t5, $t6      
    
    # Testing subu
    subu $t7, $t8, $t9   
    
    # Testing slt
    slt $t8, $t9, $t0      
    
    # Testing slti
    slti $t1, $t2, 100     

    # Testing and
    and $t0, $t1, $t2      
    
    # Testing andi
    andi $t3, $t4, 0xFF  
    
    # Testing nor
    nor $t5, $t6, $t7 
    
    # Testing or
    or $t8, $t9, $t0      

    # Testing ori
    ori $t1, $t2, 0x0F  
    
    # Testing xor
    xor $t0, $t1, $t2     
    
    # Testing xori
    xori $t3, $t4, 0xFF  

    # Testing sll
    sll $t3, $t4, 2        
    
    # Testing sllv
    sllv $t5, $t6, $t7     
    
    # Testing sra
    sra $t3, $t4, 2      
    
    # Testing srav
    srav $t5, $t6, $t7   
    
    # Testing srl
    srl $t8, $t9, 2      
    
    # Testing srlv
    srlv $t1, $t2, $t3   

    # Testing beq
    bne $t0, $t1, label1     # Branch to 'exit' if $t0 == $t1

label1:
    addiu $t1, $t1, 1

label2:
    # Testing bne
    beq $t0, $t1, exit     # Branch to 'exit' if $t0 != $t1

    # Testing jal
    jal my_function        # Jump and link to a subroutine

    la $t1, arr
    # Testing lb
    lb $t0, 0($t1)         # Load byte from memory

    addiu $t3, $t1, 4

    # Testing lbu
    lbu $t2, 0($t3)        # Load unsigned byte

    addiu $t5, $t1, 0
    # Testing lh
    lh $t4, 0($t5)         # Load halfword

    addiu $t7, $t1, 0
    # Testing lhu
    lhu $t6, 0($t7)        # Load unsigned halfword

    # Testing lui
    lui $t1, 0x1234        # Load upper immediate

    # Testing lw
    lw $t2, 0($t3)         # Load word

    # Testing sw
    sw $t4, 0($t5)         # Store word


    # Testing j
    j exit                 # Unconditional jump to 'exit'

my_function:
    # Dummy function body
    jr $ra                 # Return to caller 


exit:
    halt

