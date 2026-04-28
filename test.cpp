#include <iostream>
#include <string>
#include <map>

using namespace std;

int IDs[200005];      
int Prios[200005];    
int n = 0;          
map<int, int> ja;   

void swap_kon(int i, int j) {
    ja[IDs[i]] = j;
    ja[IDs[j]] = i;

    swap(IDs[i], IDs[j]);
    swap(Prios[i], Prios[j]);
}

bool behtare(int i, int j) {
    if (Prios[i] > Prios[j]) return true;
    if (Prios[i] == Prios[j] && IDs[i] > IDs[j]) return true;
    return false;
}

void up(int i) {
    while (i > 1 && behtare(i, i / 2)) {
        swap_kon(i, i / 2);
        i = i / 2;
    }
}

void down(int i) {
    while (2  i <= n) {
        int bache_bozorg = 2  i;
        if (bache_bozorg + 1 <= n && behtare(bache_bozorg + 1, bache_bozorg)) {
            bache_bozorg++;
        }
        if (behtare(bache_bozorg, i)) {
            swap_kon(i, bache_bozorg);
            i = bache_bozorg;
        } else break;
    }
}

int main() {
    int Q;
    cin >> Q;

    while (Q--) {
        string cmd;
        cin >> cmd;

        if (cmd == "ADD") {
            int id, p;
            cin >> id >> p;
            if (ja.find(id) != ja.end()) continue; 

            n++;
            IDs[n] = id;
            Prios[n] = p;
            ja[id] = n;
            up(n);
        }
        else if (cmd == "EXTRACT_MAX") {
            if (n == 0) {
                cout << "EMPTY" << endl;
            } else {
                cout << IDs[1] << " " << Prios[1] << endl;
                int root_id = IDs[1];
                swap_kon(1, n);
                ja.erase(root_id); 
                n--;
                if (n > 0) down(1); 
            }
        }
        else if (cmd == "CHANGE_PRIORITY") {
            int id, new_p;
            cin >> id >> new_p;
            if (ja.find(id) != ja.end()) {
                int index = ja[id];
                Prios[index] = new_p;
                up(index);  
                down(index); 
            }
        }
        else if (cmd == "REMOVE") {
            int id;
            cin >> id;
            if (ja.find(id) != ja.end()) {
                int index = ja[id];
                int akharin_id = IDs[n];
                swap_kon(index, n);
                ja.erase(id);
                n--;
                if (index <= n) {
                    up(index);
                    down(index);
                }
            }
        }
        else if (cmd == "GET_PRIORITY") {
            int id;

            cin >> id;
            if (ja.find(id) == ja.end()) {
                cout << "NOT FOUND" << endl;
            } else {
                cout << Prios[ja[id]] << endl;
            }
        }
    }
    return 0;
}