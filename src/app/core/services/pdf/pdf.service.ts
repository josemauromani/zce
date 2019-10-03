import { Inject, Injectable } from '@angular/core';

import { IAnswerRow, IQuestion, IQuestionRow } from '@app/core/interfaces';
import { Logger, QuestionService } from '@app/core/services';
import { environment } from '@env/environment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

const log = new Logger('PdfService');

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private questionArray: IQuestion[] = [];

  constructor(
    private questionService: QuestionService,
    @Inject('moment') private moment: any
  ) {
  }

  public exportTestAsPDF(questionNumber: number = 1) {
    this.questionArray = [];
    this.questionService.getQuestion(questionNumber).subscribe(
      (question: IQuestion) => this.questionArray.push(question),
      error => log.error(error),
      () => this.generatePDF()
    );
  }

  private generatePDF() {
    const letters = environment.configPHP.letters;
    const content: Array<any> = [];
    const correctAnswer: Array<any> = [];

    for (let i = 0; i < this.questionArray.length; i++) {
      const question = this.questionArray[i];
      const questionBody: Array<any> = [];
      const answerBody: Array<any> = [];
      const correct: Array<any> = [];
      content.push({
        text: 'Question ' + (i + 1),
        style: 'h1'
      });

      question.questionRows.forEach((obj: IQuestionRow) => {
        const questionRow = {
          text: obj.text,
          fontSize: 8,
          fillColor: '#FFF',
        };
        if (obj.language === 2) {
          questionRow.fontSize = 12;
        }
        if (obj.language === 1) {
          questionRow.fillColor = '#F6F8FA';
        }
        questionBody.push([questionRow]);
      });

      content.push({
        style: 'invoiceTable',
        table: {
          widths: ['*'],
          body: questionBody
        },
        layout: 'headerLineOnly'
      });

      question.answerRows.forEach((obj: IAnswerRow, key: number) => {
        const answerRow = {
          text: obj.text,
          fillColor: '#FFF'
        };
        if (obj.correct === true) {
          correct.push(letters[key]);
        }
        if (obj.language === 1) {
          answerRow.fillColor = '#F6F8FA';
        }
        answerBody.push([{
          table: {
            body: [
              [letters[key]]
            ]
          }
        }]);
        answerBody.push([answerRow]);
        answerBody.push([{text: '\n'}]);
      });
      correctAnswer[i] = correct;

      content.push({
        style: 'invoiceTable',
        pageBreak: 'after',
        table: {
          widths: ['*'],
          body: answerBody
        },
        layout: 'headerLineOnly'
      });
    }

    content.push({
      text: 'Answers',
      style: 'h1'
    });

    correctAnswer.forEach((ans, key) => {
      content.push({
        text: `Answer for question  ${key + 1}`,
        style: 'subheader'
      });
      content.push({
        text: ans.join(),
      });
    });

    content.push({text: '\n\r'});
    content.push({qr: 'https://alceanicu.github.io/zce'});

    const name = this.moment().format('YYYY_MM_DD_HH:mm:ss');

    const docDefinition = {
      content: content,
      watermark: {
        text: 'ZCE - Exam Simulator',
        color: 'blue',
        opacity: 0.1,
        bold: true,
        italics: false
      },
      info: {
        title: 'ZCE - Exam Simulator',
        author: 'Nicu ALCEA',
        subject: 'ZCE - Exam Simulator for Zend PHP Engineer Certification',
        keywords: 'PHP, question, test, certification, zend',
        creationDate: name
      },
      styles: {
        invoiceTable: {
          margin: [0, 5, 0, 15]
        },
        h1: {
          bold: true,
          fontSize: 16,
          color: 'black',
          alignment: 'center'
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
      },
      defaultStyle: {
        fontSize: 8
      }
    };

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.createPdf(docDefinition).download(`${name}.pdf`);
  }
}
