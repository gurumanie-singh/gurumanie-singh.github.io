main:
    # Arithmetic Instructions
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
    
    # Comparison Instructions
    # Testing slt
    slt $t8, $t9, $t0      
    
    # Testing slti
    slti $t1, $t2, 100     

    # Logical Instructions
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

    # Shift Instructions
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

exit:
    halt

