#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

#define MAX_INPUT 1024
#define MAX_ARGS 64

// Function to parse the user's input with the arguments
int parse_input(char *input, char **args) {
    int i = 0;
    char *token = strtok(input, " \t\n");
    
    while (token != NULL && i < MAX_ARGS - 1) {
        args[i] = token;
        i++;
        token = strtok(NULL, " \t\n");
    }
    args[i] = NULL;
    return i;
}

// Function to check for background process (& at the end)
int is_bg(char **args, int argc) {
    if (argc > 0 && strcmp(args[argc - 1], "&") == 0) {
        args[argc - 1] = NULL; // Remove & from args
        return 1;
    }
    return 0;
}

// Function to handle the built-in commands
int handle_builtin(char **args) {
    if (args[0] == NULL) {
        return 0;
    }
    
    // exit
    if (strcmp(args[0], "exit") == 0) {
        exit(0);
    }
    
    // pid
    if (strcmp(args[0], "pid") == 0) {
        printf("%d\n", getpid());
        return 1;
    }
    
    // ppid
    if (strcmp(args[0], "ppid") == 0) {
        printf("%d\n", getppid());
        return 1;
    }
    
    // pwd
    if (strcmp(args[0], "pwd") == 0) {
        char cwd[MAX_INPUT];
        if (getcwd(cwd, sizeof(cwd)) != NULL) {
            printf("%s\n", cwd);
        } else {
            perror("getcwd");
        }
        return 1;
    }
    
    // cd
    if (strcmp(args[0], "cd") == 0) {
        char *dir;
        if (args[1] == NULL) {
            dir = getenv("HOME"); // For the case where it is just cd, without any arguments
        } else {
            dir = args[1];
        }
        
        if (chdir(dir) != 0) {
            perror("cd");
        }
        return 1;
    }
    
    return 0; // Not any of the above builtin commands
}

// Function that checks for any finished background processes
void check_bg() {
    int status;
    pid_t pid;
    
    // Check on the children without blocking other processes
    while ((pid = waitpid(-1, &status, WNOHANG)) > 0) {
        if (WIFEXITED(status)) {
            printf("[%d] Exit %d\n", pid, WEXITSTATUS(status));
        } else if (WIFSIGNALED(status)) {
            printf("[%d] Killed (%d)\n", pid, WTERMSIG(status));
        }
    }
}

// Function to execute a program's command
void execute_command(char **args, int bg) {
    pid_t pid = fork();
    
    if (pid < 0) {
        perror("fork");
        return;
    }
    
    if (pid == 0) {
        // Child process
        execvp(args[0], args);
        // If execvp returns, this means there was some issue
        printf("Cannot exec %s: No such file or directory\n", args[0]);
        exit(255);
    } else {
        // Parent process
        printf("[%d] %s\n", pid, args[0]);
        
        if (!bg) {
            // Wait for the foreground process
            int status;
            waitpid(pid, &status, 0);
            
            if (WIFEXITED(status)) {
                printf("[%d] %s Exit %d\n", pid, args[0], WEXITSTATUS(status));
            } else if (WIFSIGNALED(status)) {
                printf("[%d] %s Killed (%d)\n", pid, args[0], WTERMSIG(status));
            }
        }
    }
}

// Main method
int main(int argc, char **argv) {
    char input[MAX_INPUT];
    char *args[MAX_ARGS];
    char *prompt = "308sh> ";
    
    // Check for -p flag
    if (argc == 3 && strcmp(argv[1], "-p") == 0) {
        prompt = argv[2];
    }
    
    // Main shell loop
    while (1) {
        // Check for any finished background processes
        check_bg();
        
        // Display the required prompt
        printf("%s", prompt);
        fflush(stdout);
        
        // Read the user's input
        if (fgets(input, MAX_INPUT, stdin) == NULL) {
            break; // EOF
        }
        
        // Parse input
        int arg_count = parse_input(input, args);
        
        if (arg_count == 0) {
            continue; // received some empty input
        }
        
        // Check if the process is a background process
        int bg = is_bg(args, arg_count);
        
        // Handle the builtin commands
        if (handle_builtin(args)) {
            continue;
        }
        
        // Execute program's command
        execute_command(args, bg);
    }
    
    return 0;
}