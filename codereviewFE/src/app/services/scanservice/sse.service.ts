import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService {

    constructor(private readonly ngZone: NgZone) { }

    // ถ้าหลังบ้านส่ง JSON มา จะได้เป็น any
    connect(repoId: string): Observable<any> {
        return new Observable(observer => {
            const es = new EventSource(`http://localhost:8080/api/sse/subscribe?repoId=${encodeURIComponent(repoId)}`);

            // event หลักที่เราตั้งชื่อจาก backend ว่า scan-complete
            es.addEventListener('scan-complete', (event: MessageEvent) => {
                this.ngZone.run(() => {
                    let data: any = event.data;
                    // เผื่อ backend ส่งเป็น JSON string
                    try {
                        data = JSON.parse(event.data);
                    } catch (_) {
                        // ถ้า parse ไม่ได้ก็ปล่อยเป็น string
                    }
                    observer.next(data);
                });
            });

            // default message เผื่อ backend ส่งแบบไม่มีชื่อ event
            es.onmessage = (event: MessageEvent) => {
                this.ngZone.run(() => {
                    let data: any = event.data;
                    try {
                        data = JSON.parse(event.data);
                    } catch (_) { }
                    observer.next(data);
                });
            };

            es.onerror = (err) => {
                this.ngZone.run(() => {
                    observer.error(err);
                });
                es.close();
            };

            // cleanup ตอน unsubscribe
            return () => {
                es.close();
            };
        });
    }
}
