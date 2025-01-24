import { Component, ElementRef, ViewChild  } from '@angular/core';
import { HomeService } from '../services/home.service';
import { StorageService } from '../services/storage.service';
import { ConnectionService } from '../services/network.service';
import { ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Task } from '../models/task.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('actionButton') actionButton!: ElementRef<HTMLButtonElement>;

  isOnline: boolean = false;
  todos: any[] = [];
  filteredItems: any[] = [];
  searchBarValue: string = '';
  userId: number = 152; // static userId, used for testing  

  constructor(
    private connectionService: ConnectionService,
    private alertController: AlertController,
    private homeService: HomeService,
    private storageService: StorageService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        const updatedTask = (navigation.extras.state['task']);
        let indexToUpdate = this.filteredItems.findIndex(item => item.id === updatedTask.id);
        if (navigation.extras.state['role'] === 'new') {
          this.filteredItems.unshift(updatedTask);
        } else {
          this.filteredItems[indexToUpdate] = updatedTask;  
        }
        this.storageService.saveTasks(this.userId, this.filteredItems);
      } 
    });
    this.connectionService.getConnectionStatus().subscribe((status) => {
      if (status !== this.isOnline) {
        this.isOnline = status;
      }
    });
    this.getUserTasks();
  } 

 
  getUserTasks() {
    this.storageService.getTasks(this.userId)
      .then((resLocal: Task[] | null | undefined) => {
        resLocal = resLocal || [];
        if (this.isOnline) {
          this.homeService.getTasks(this.userId).subscribe(
            (resApi) => { // merge both tasks array: local and remote
              const newItems = resApi.todos.filter((apiItem: Task) => {
                return !resLocal.some((localItem: Task) => localItem.id === apiItem.id);
              });
              const updatedTasks = [...resLocal, ...newItems];
              this.todos = updatedTasks;
              this.filteredItems = this.todos;
              this.storageService.saveTasks(this.userId, updatedTasks);
            },
            (error) => {
              this.presentAlert('Error homeService.getTasks:', error);
            }
          );
        } else {
          this.presentToast('You are disconnected. Only local data will be shown if exists.');
          this.todos = resLocal;
          this.filteredItems = this.todos;
        }
      })
      .catch((storageError) => {
        this.presentAlert('Error storageService.getTasks:', storageError);
      });
  }

  filterItems() {
    if (this.searchBarValue.trim() === '') {
      this.filteredItems = this.todos;
    } else {
      this.filteredItems = this.todos.filter(item =>
        item.todo.toLowerCase().includes(this.searchBarValue.toLowerCase())
      );
    }
  }

  changeTaskStatus(task: any) {
    task.completed = !task.completed;
    this.presentToast('Task #'+ task.id + ' updated to ' + (task.completed === true ? '"Concluded"' : '"Pending"'));
    const updatedTask = { completed: task.completed }
    
    this.storageService.saveTasks(this.userId, this.filteredItems);

    if (this.isOnline) {
      this.homeService.editTask(task.id, updatedTask).subscribe(
        () => { },
        (error) => {
          if (error.status === 404) {
            this.presentAlert('Error: Task not found on server!', 'Task has been updated locally.');
          } else if (error.status === 500) {
            this.presentAlert('Server Error', 'An error has occurred. Try again later.');
          } else {
            this.presentAlert(`Unknown Error ${error.status || ''}`, error.message || 'Something went wrong.');
          }
        }
      );
    } else {
      this.presentToast('You are disconnected. Only local data will be updated.');
    }
    
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  async presentActionSheet(item: any) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Edit',
          icon: 'create',
          handler: () => this.editTask(item)
        },
        {
          text: 'Remove',
          icon: 'trash',
          role: 'destructive',
          handler: () => this.deleteTask(item.id)
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    actionSheet.onDidDismiss().then(() => {
      if (this.actionButton && this.actionButton.nativeElement) {
        this.actionButton.nativeElement.focus();
      }
    });
    await actionSheet.present();
  }

  newTask() {
    const navigationExtras: NavigationExtras = {
      state: {
        role: 'new',
        task: null,
        title: 'New Task',
        userId: this.userId
      }
    };  
    this.router.navigate(['/details'], navigationExtras);
  }

  editTask(item: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        role: 'edit',
        task: item,
        title: 'Edit Task #' + item.id,
        userId: this.userId
      }
    };  
    this.router.navigate(['/details'], navigationExtras);
  }

  deleteTask(taskId: number) {
    this.filteredItems = this.filteredItems.filter(item => item.id !== taskId);
    this.todos = this.filteredItems;

    this.storageService.saveTasks(this.userId, this.filteredItems);
    
    if (this.isOnline) {
      this.homeService.deleteTask(taskId).subscribe(
        () => {},
        (error) => {
          if (error.status === 404) {
            this.presentAlert('Error: Task not found on server!', 'Task has been removed locally.');
          } else if (error.status === 500) {
            this.presentAlert('Server Error', 'An error has occurred. Try again later.');
          } else {
            this.presentAlert(`Unknown Error ${error.status || ''}`, error.message || 'Something went wrong.');
          }
        }
      );
    } else {
      this.presentToast('You are disconnected. Only local data will be removed.');
    }
    
  }

  async presentAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
