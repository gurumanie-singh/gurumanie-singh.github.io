#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <sys/time.h>
#include "Bank.h"

// Max accounts in a single transaction
#define MAX_TRANS_ACCOUNTS 10

// Struct for every account_ID and amount pair in a transaction
typedef struct {
    int account_id;
    int amount;
} Transaction;

// Struct for a request in the queue
typedef struct RequestNode {
    int request_id;
    int is_check;  // 1 means CHECK, 0 means it is a TRANS
    int check_account;  // Used only for CHECK requests
    Transaction transactions[MAX_TRANS_ACCOUNTS];
    int num_transactions;
    struct timeval start_time;
    struct timeval end_time;
    struct RequestNode *next;
} RequestNode;

// Queue struct
typedef struct {
    RequestNode *head;
    RequestNode *tail;
    int count;
} RequestQueue;

// Global variables
RequestQueue request_queue;
pthread_mutex_t queue_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t queue_cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t *account_mutexes;  // Array of mutexes
FILE *output_file;
int num_accounts;
int server_running = 1;

// This function should add a request to the queue
void enqueue_request(RequestNode *request) {
    pthread_mutex_lock(&queue_mutex);
    
    if (request_queue.tail == NULL) {
        request_queue.head = request;
        request_queue.tail = request;
    } else {
        request_queue.tail->next = request;
        request_queue.tail = request;
    }
    request_queue.count++;
    
    pthread_cond_broadcast(&queue_cond);
    pthread_mutex_unlock(&queue_mutex);
}

// This function should remove a request from the queue
RequestNode* dequeue_request() {
    pthread_mutex_lock(&queue_mutex);
    
    while (request_queue.head == NULL && server_running) {
        pthread_cond_wait(&queue_cond, &queue_mutex);
    }
    
    if (!server_running && request_queue.head == NULL) {
        pthread_mutex_unlock(&queue_mutex);
        return NULL;
    }
    
    RequestNode *request = request_queue.head;
    request_queue.head = request->next;
    if (request_queue.head == NULL) {
        request_queue.tail = NULL;
    }
    request_queue.count--;
    
    pthread_mutex_unlock(&queue_mutex);
    return request;
}

// Comparison function for sorting our account IDs
int compare_ints(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}

// Process a CHECK request
void process_check(RequestNode *request) {
    int account_id = request->check_account;
    
    // Lock the account first
    pthread_mutex_lock(&account_mutexes[account_id - 1]);
    
    int balance = read_account(account_id);
    
    // Unlock the account
    pthread_mutex_unlock(&account_mutexes[account_id - 1]);
    
    gettimeofday(&request->end_time, NULL);
    
    // Write to the output file
    flockfile(output_file);
    fprintf(output_file, "%d BAL %d TIME %ld.%06ld %ld.%06ld\n",
            request->request_id, balance,
            request->start_time.tv_sec, request->start_time.tv_usec,
            request->end_time.tv_sec, request->end_time.tv_usec);
    fflush(output_file);
    funlockfile(output_file);
}

// Process a TRANS request
void process_transaction(RequestNode *request) {
    int i;
    
    // Create an array of unique account IDs and then sort them
    int account_ids[MAX_TRANS_ACCOUNTS];
    for (i = 0; i < request->num_transactions; i++) {
        account_ids[i] = request->transactions[i].account_id;
    }
    qsort(account_ids, request->num_transactions, sizeof(int), compare_ints);
    
    // Lock all the accounts in the sorted order to avoid deadlock situuations
    for (i = 0; i < request->num_transactions; i++) {
        pthread_mutex_lock(&account_mutexes[account_ids[i] - 1]);
    }
    
    // Read the current balance and check for any insufficient funds
    int balances[MAX_TRANS_ACCOUNTS];
    int isf_account = 0;
    
    for (i = 0; i < request->num_transactions; i++) {
        int acc_id = request->transactions[i].account_id;
        int amount = request->transactions[i].amount;
        int current_balance = read_account(acc_id);
        
        if (current_balance + amount < 0) {
            isf_account = acc_id;
            break;
        }
        balances[i] = current_balance + amount;
    }
    
    // If there are no insufficient funds, then apply the transaction
    if (isf_account == 0) {
        for (i = 0; i < request->num_transactions; i++) {
            write_account(request->transactions[i].account_id, balances[i]);
        }
    }
    
    // Unlock all accounts in their reverse order
    for (i = request->num_transactions - 1; i >= 0; i--) {
        pthread_mutex_unlock(&account_mutexes[account_ids[i] - 1]);
    }
    
    gettimeofday(&request->end_time, NULL);
    
    // Write to the output file
    flockfile(output_file);
    if (isf_account == 0) {
        fprintf(output_file, "%d OK TIME %ld.%06ld %ld.%06ld\n",
                request->request_id,
                request->start_time.tv_sec, request->start_time.tv_usec,
                request->end_time.tv_sec, request->end_time.tv_usec);
    } else {
        fprintf(output_file, "%d ISF %d TIME %ld.%06ld %ld.%06ld\n",
                request->request_id, isf_account,
                request->start_time.tv_sec, request->start_time.tv_usec,
                request->end_time.tv_sec, request->end_time.tv_usec);
    }
    fflush(output_file);
    funlockfile(output_file);
}

// Worker thread function
void* worker_thread(void *arg) {
    while (1) {
        RequestNode *request = dequeue_request();
        
        if (request == NULL) {
            break;  // Server is shutting down
        }
        
        if (request->is_check) {
            process_check(request);
        } else {
            process_transaction(request);
        }
        
        free(request);
    }
    
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc != 4) {
        printf("Usage: %s <num_workers> <num_accounts> <output_file>\n", argv[0]);
        return 1;
    }
    
    int num_workers = atoi(argv[1]);
    num_accounts = atoi(argv[2]);
    char *output_filename = argv[3];
    
    // Initialize the accounts
    if (!initialize_accounts(num_accounts)) {
        printf("Error initializing accounts\n");
        return 1;
    }
    
    // Allocate mutexes for each individual account
    account_mutexes = malloc(num_accounts * sizeof(pthread_mutex_t));
    for (int i = 0; i < num_accounts; i++) {
        pthread_mutex_init(&account_mutexes[i], NULL);
    }
    
    // Open the output file
    output_file = fopen(output_filename, "w");
    if (output_file == NULL) {
        printf("Error opening output file\n");
        return 1;
    }
    
    // Initialize queue
    request_queue.head = NULL;
    request_queue.tail = NULL;
    request_queue.count = 0;
    
    // Create the needed worker threads
    pthread_t *threads = malloc(num_workers * sizeof(pthread_t));
    for (int i = 0; i < num_workers; i++) {
        pthread_create(&threads[i], NULL, worker_thread, NULL);
    }
    
    // Main loop to read requests from stdin
    char line[1024];
    int request_id = 1;
    
    while (fgets(line, sizeof(line), stdin)) {
        line[strcspn(line, "\n")] = 0;
        
        char *token = strtok(line, " ");
        if (token == NULL) continue;
        
        if (strcmp(token, "END") == 0) {
            break;
        }
        
        RequestNode *request = malloc(sizeof(RequestNode));
        request->request_id = request_id;
        request->next = NULL;
        gettimeofday(&request->start_time, NULL);
        
        if (strcmp(token, "CHECK") == 0) {
            request->is_check = 1;
            token = strtok(NULL, " ");
            request->check_account = atoi(token);
        } else if (strcmp(token, "TRANS") == 0) {
            request->is_check = 0;
            request->num_transactions = 0;
            
            while ((token = strtok(NULL, " ")) != NULL) {
                int account_id = atoi(token);
                token = strtok(NULL, " ");
                if (token == NULL) break;
                int amount = atoi(token);
                
                request->transactions[request->num_transactions].account_id = account_id;
                request->transactions[request->num_transactions].amount = amount;
                request->num_transactions++;
            }
        } else {
            free(request);
            continue;
        }
        
        printf("ID %d\n", request_id);
        fflush(stdout);
        
        enqueue_request(request);
        request_id++;
    }
    
    // Signal the shutdown
    pthread_mutex_lock(&queue_mutex);
    server_running = 0;
    pthread_cond_broadcast(&queue_cond);
    pthread_mutex_unlock(&queue_mutex);
    
    // Wait for all the worker threads to finish
    for (int i = 0; i < num_workers; i++) {
        pthread_join(threads[i], NULL);
    }
    
    // Clean up everything
    fclose(output_file);
    free_accounts();
    free(threads);
    for (int i = 0; i < num_accounts; i++) {
        pthread_mutex_destroy(&account_mutexes[i]);
    }
    free(account_mutexes);
    
    return 0;
}
