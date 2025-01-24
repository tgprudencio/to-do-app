import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { HomeService } from '../services/home.service';
import { AlertController } from '@ionic/angular';
import { ConnectionService } from '../services/network.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: false,
})
export class DetailsPage implements OnInit {
  isOnline: boolean = false;
  data: any;
  formData = {
    title: '',
    todo: '',
    deadline: '',
    completed: false,
    userId: ''
  };
  minDate: string;

  formattedObj: { [key: string]: any } = {
    todo: '',
    userId: '',
    completed: '',
    deadline: '',
  }
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private homeService: HomeService,
    private alertController: AlertController,
    private connectionService: ConnectionService,
  ) {
    this.minDate = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.route.queryParams.subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        this.data = navigation.extras.state;
        if (this.data.role === 'edit') {
          // Split string into "title" and "description" to fill respective fields
          if (this.data.task.todo.includes(' || ')) {
            var splittedString = this.data.task.todo.split(' || ');
            this.formData.title = splittedString[0];
            this.formData.todo = splittedString[1];
          } else {
            this.formData.todo = this.data.task.todo;
          }
          this.formData.completed = this.data.task.completed;
          this.formData.deadline = this.data.task.deadline;
        }
        this.formData.userId = this.data.userId;
        console.log('dados recebido em details:', navigation.extras.state)
      } 
    });
    this.connectionService.getConnectionStatus().subscribe((status) => {
      if (status !== this.isOnline) {
        this.isOnline = status;
      }
    });
  }

  wrapUpInsertRoutine() {
    this.formattedObj['id'] = Math.floor(Math.random() * 10000);
    this.presentAlert('Success', 'Task created successfully', true)
  }

  wrapUpEditRoutine() {
    this.formattedObj['id'] = this.data.task.id;
    this.presentAlert('Success', 'Task updated successfully', true);
  }

  onSubmit() {
    this.formattedObj['todo'] = this.formData.title ? this.formData.title + " || " + this.formData.todo : this.formData.todo;
    this.formattedObj['completed'] = this.formData.completed;
    this.formattedObj['deadline'] =  this.formData.deadline;
    this.formattedObj['userId'] = this.formData.userId;

    if (this.data.role === 'edit') { // Update Task
      if (this.isOnline) {
        this.homeService.editTask(this.data.task.id, this.formattedObj).subscribe(
          () => this.wrapUpEditRoutine(),
          (error) => {
            if (error.status === 404) {
              this.formattedObj['id'] = this.data.task.id;
              this.presentAlert('Error: Task not found on server!', 'Task has been updated locally.', true);
            } else if (error.status === 500) {
              this.presentAlert('Server Error', 'An error has occurred. Try again later.', false);
            } else {
              this.presentAlert(`Unknown Error ${error.status || ''}`, error.message || 'Something went wrong.', false);
            }
          }
        );
      } else {
        this.formattedObj['id'] = this.data.task.id;
        this.presentAlert('Success', 'You are disconnected. Task updated successfully', true);
      }
    } else { // Insert Task
      this.homeService.insertTask(this.formData).subscribe(
        () => this.wrapUpInsertRoutine(),
        (error) => {
          if (error.status === 500) {
            this.presentAlert('Server Error', 'An error has occurred. Try again later.', false);
          } else {
            this.presentAlert(`Unknown Error ${error.status || ''}`, error.message || 'Something went wrong.', false);
          }
        }
      );
    }
    
  }

  dismiss() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  async presentAlert(title: string, message: string, success: boolean) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: [{
        text: 'OK',
        handler: () => {
          const navigationExtras: NavigationExtras = {
            state: {
              role: this.data.role,
              task: this.formattedObj
            }
          };  
          success ? this.router.navigate(['/home'], navigationExtras ) : null;
        }}
      ],
    });

    await alert.present();
  }

}
