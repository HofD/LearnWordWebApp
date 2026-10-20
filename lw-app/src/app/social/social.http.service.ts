import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Collection } from '../collection/collection';

export enum CollectionVisibility { Private = 0, Unlisted = 1, Public = 2 }
export interface SocialSummary { publicId: string; name: string; author: string; cardsCount: number; }
export interface SocialPage { items: SocialSummary[]; page: number; pageSize: number; totalCount: number; }
export interface SocialDetails extends SocialSummary {
  isOwner: boolean;
  ownerCollectionId: number | null;
  cards: { words: { value: string; transcription: string; translation: string }[] }[];
  page: number;
  pageSize: number;
  totalCount: number;
}
@Injectable({ providedIn: 'root' })
export class SocialHttpService {
  private readonly url = `${environment.apiUrl}/api/social/collections`;
  constructor(private http: HttpClient) {}
  explore(page = 1, search = '', pageSize = 25) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('search', search);
    return this.http.get<SocialPage>(this.url, { params });
  }
  get(publicId: string, page = 1, pageSize = 25, search = '') {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('search', search);
    return this.http.get<SocialDetails>(`${this.url}/${encodeURIComponent(publicId)}`, { params });
  }
  fork(publicId: string) {
    return this.http.post<Collection>(`${this.url}/${encodeURIComponent(publicId)}/fork`, {});
  }
  visibility(id: number, visibility: CollectionVisibility) {
    return this.http.put<Collection>(`${environment.apiUrl}/api/collections/${id}/visibility`, { visibility });
  }
}
