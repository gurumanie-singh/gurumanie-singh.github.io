main:
    lui $t0, 10
    
    jal my_func
    j exit

my_func:
    nop
    nop
    nop  
    nop
    jr $ra
    nop

exit:
    halt

